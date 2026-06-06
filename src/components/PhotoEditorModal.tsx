import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Minus, Plus, RotateCw, X } from 'lucide-react';
import { restoreAppFocus } from '../utils/dialog';

const VIEWPORT_SIZE = 300;
const CROP_SIZE = 240;
const OUTPUT_SIZE = 600;
const CROP_OFFSET = (VIEWPORT_SIZE - CROP_SIZE) / 2;
const MIN_ZOOM = 0.02;
const ZOOM_STEP = 0.025;
const MAX_ZOOM = 4;
const ZOOM_TRANSITION_MS = 140;

interface Props {
  imageSrc: string;
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

function renderCroppedPhoto(
  image: HTMLImageElement,
  zoom: number,
  rotation: number,
  position: { x: number; y: number }
): string {
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const context = canvas.getContext('2d');
  if (!context) return imageSrcFallback(image);

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const scale = OUTPUT_SIZE / CROP_SIZE;

  context.save();
  context.beginPath();
  context.rect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  context.clip();
  context.scale(scale, scale);
  context.translate(-CROP_OFFSET, -CROP_OFFSET);

  const centerX = VIEWPORT_SIZE / 2 + position.x;
  const centerY = VIEWPORT_SIZE / 2 + position.y;

  context.translate(centerX, centerY);
  context.rotate((rotation * Math.PI) / 180);
  context.scale(zoom, zoom);
  context.drawImage(
    image,
    -image.naturalWidth / 2,
    -image.naturalHeight / 2,
    image.naturalWidth,
    image.naturalHeight
  );
  context.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
}

function imageSrcFallback(image: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const context = canvas.getContext('2d');
  if (!context) return '';
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  const scale = Math.max(OUTPUT_SIZE / image.naturalWidth, OUTPUT_SIZE / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, (OUTPUT_SIZE - width) / 2, (OUTPUT_SIZE - height) / 2, width, height);
  return canvas.toDataURL('image/jpeg', 0.92);
}

function calcFitZoom(width: number, height: number): number {
  return Math.min(CROP_SIZE / width, CROP_SIZE / height, 1);
}

function clampZoom(value: number, minZoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(minZoom, value));
}

const PhotoEditorModal: React.FC<Props> = ({ imageSrc, onSave, onCancel }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imageReady, setImageReady] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const minZoomRef = useRef(MIN_ZOOM);
  const zoomAnimRef = useRef<number | null>(null);
  const zoomTargetRef = useRef(1);
  const zoomRef = useRef(1);
  const dragging = useRef(false);
  const dragOrigin = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  const stopZoomAnimation = useCallback(() => {
    if (zoomAnimRef.current !== null) {
      cancelAnimationFrame(zoomAnimRef.current);
      zoomAnimRef.current = null;
    }
  }, []);

  const animateZoomTo = useCallback(
    (target: number) => {
      stopZoomAnimation();
      const clampedTarget = clampZoom(target, minZoomRef.current);
      zoomTargetRef.current = clampedTarget;

      const startZoom = zoomRef.current;
      const delta = clampedTarget - startZoom;
      if (Math.abs(delta) < 0.001) {
        setZoom(clampedTarget);
        zoomRef.current = clampedTarget;
        return;
      }

      const startTime = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startTime) / ZOOM_TRANSITION_MS);
        const eased = 1 - (1 - progress) ** 3;
        const nextZoom = startZoom + delta * eased;
        setZoom(nextZoom);
        zoomRef.current = nextZoom;

        if (progress < 1) {
          zoomAnimRef.current = requestAnimationFrame(tick);
        } else {
          zoomAnimRef.current = null;
          setZoom(clampedTarget);
          zoomRef.current = clampedTarget;
        }
      };

      zoomAnimRef.current = requestAnimationFrame(tick);
    },
    [stopZoomAnimation]
  );

  useEffect(() => {
    zoomRef.current = zoom;
    zoomTargetRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      const fitZoom = calcFitZoom(image.naturalWidth, image.naturalHeight);
      minZoomRef.current = Math.min(fitZoom * 0.5, MIN_ZOOM);
      setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
      setZoom(fitZoom);
      zoomTargetRef.current = fitZoom;
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setImageReady(true);
    };
    image.onerror = () => setImageReady(false);
    image.src = imageSrc;

    return () => stopZoomAnimation();
  }, [imageSrc, stopZoomAnimation]);

  const zoomIn = () => animateZoomTo(zoomTargetRef.current + ZOOM_STEP);
  const zoomOut = () => animateZoomTo(zoomTargetRef.current - ZOOM_STEP);
  const rotate = () => setRotation((value) => (value + 90) % 360);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const factor = event.deltaY < 0 ? 1 + ZOOM_STEP : 1 - ZOOM_STEP;
    animateZoomTo(zoomRef.current * factor);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    stopZoomAnimation();
    dragging.current = true;
    setIsDragging(true);
    dragOrigin.current = {
      x: event.clientX,
      y: event.clientY,
      posX: position.x,
      posY: position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    setPosition({
      x: dragOrigin.current.posX + (event.clientX - dragOrigin.current.x),
      y: dragOrigin.current.posY + (event.clientY - dragOrigin.current.y),
    });
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleSave = useCallback(() => {
    if (!imageRef.current) return;
    onSave(renderCroppedPhoto(imageRef.current, zoom, rotation, position));
    restoreAppFocus();
  }, [onSave, position, rotation, zoom]);

  const handleCancel = () => {
    stopZoomAnimation();
    onCancel();
    restoreAppFocus();
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Редактирование фото</h3>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-4">
          <p className="text-[11px] text-gray-500 mb-3">
            Перетащите фото для кадрирования. Колёсико мыши — плавный масштаб.
          </p>

          <div className="flex justify-center">
            <div
              className="relative rounded-xl overflow-hidden bg-gray-900 select-none touch-none"
              style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onWheel={handleWheel}
            >
              <div className="absolute inset-0 overflow-hidden">
                {imageReady && imageSize.width > 0 ? (
                  <img
                    src={imageSrc}
                    alt=""
                    draggable={false}
                    className="absolute max-w-none pointer-events-none"
                    style={{
                      width: imageSize.width,
                      height: imageSize.height,
                      left: '50%',
                      top: '50%',
                      marginLeft: -imageSize.width / 2,
                      marginTop: -imageSize.height / 2,
                      transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
                      transformOrigin: 'center center',
                      transition: isDragging ? 'none' : 'transform 0.14s cubic-bezier(0.22, 1, 0.36, 1)',
                      willChange: 'transform',
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                    Загрузка...
                  </div>
                )}
              </div>

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-0 right-0 top-0 bg-black/45" style={{ height: CROP_OFFSET }} />
                <div className="absolute left-0 right-0 bottom-0 bg-black/45" style={{ height: CROP_OFFSET }} />
                <div className="absolute top-0 bottom-0 left-0 bg-black/45" style={{ width: CROP_OFFSET }} />
                <div className="absolute top-0 bottom-0 right-0 bg-black/45" style={{ width: CROP_OFFSET }} />
                <div
                  className="absolute border-2 border-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
                  style={{
                    left: CROP_OFFSET,
                    top: CROP_OFFSET,
                    width: CROP_SIZE,
                    height: CROP_SIZE,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={zoomOut}
              title="Отдалить"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 transition"
            >
              <Minus size={16} strokeWidth={2.5} />
            </button>
            <span className="min-w-[48px] text-center text-xs font-bold text-gray-600 tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              title="Приблизить"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 transition"
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={rotate}
              title="Повернуть на 90°"
              className="ml-1 flex items-center gap-1.5 px-3 h-9 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 transition text-xs font-semibold"
            >
              <RotateCw size={15} />
              90°
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/80">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!imageReady}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoEditorModal;
