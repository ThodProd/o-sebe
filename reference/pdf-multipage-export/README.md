# PDF: несколько листов в одном файле (эталонная реализация)

Снимок рабочего варианта от **июня 2026**. Не удалять и не править без копии — это эталон для восстановления экспорта.

## Суть подхода

**Один поток HTML** → Electron `webContents.printToPDF()` → **один PDF со всеми страницами**.

Не использовать:
- дублирование шаблона на каждый лист с `marginTop` / `overflow: hidden`;
- `webContents.print()` как основной путь (часто 1 лист, Letter, обрезка);
- непрозрачный футер поверх контента.

## Цепочка файлов (в проекте)

| Роль | Файл |
|------|------|
| Кнопка PDF | `src/App.tsx` → `exportResumePDF()` |
| Экспорт | `src/utils/resumeExport.ts` |
| Разметка | `src/components/ResumePreview.tsx` + `ResumeDocument.tsx` |
| Переносы строк | `src/components/MultilineText.tsx` + `.resume-break-unit` в шаблонах |
| Стили печати | `src/index.css` (`@media print`) |
| Electron PDF | `electron/main.cjs` → `file:printToPDF` |
| IPC | `electron/preload.cjs` → `printToPDF` |
| Типы | `src/types/electron.d.ts` |

## Ключевые принципы

### 1. Один рендер контента

`ResumeDocument` рендерит шаблон **один раз**. Номера страниц и разделители — только для экрана (`print-hidden`), в PDF не попадают.

### 2. Многостраничность через CSS

```css
@page { size: A4 portrait; margin: 0; }

.resume-break-unit,
.resume-break-line {
  break-inside: avoid;
  page-break-inside: avoid;
}
```

При печати/PDF: `height: auto`, `overflow: visible` на `#resume-preview` и родителях; `transform: none` на `.resume-preview-zoom`.

### 3. Electron printToPDF

```javascript
await win.webContents.printToPDF({
  pageSize: "A4",
  printBackground: true,
  margins: { marginType: "none" },
  preferCSSPageSize: true,  // важно: страницы из @page
});
```

Диалог «Сохранить PDF» — `dialog.showSaveDialog`, затем `fs.writeFileSync(filePath, data)`.

### 4. Ожидание готовности DOM

Перед PDF: `document.fonts.ready`, загрузка `img`, двойной `requestAnimationFrame`, пауза ~150 ms.

### 5. Имя файла

`#resume-preview` с `data-export-name` (ФИО) → `sanitizeExportName` → `Имя.pdf`.

## Восстановление после поломки

1. Сверить файлы в этой папке с `src/` и `electron/`.
2. Убедиться, что `exportResumePDF` вызывает `printToPDF`, а не `printResume`.
3. Убедиться, что нет `PaginatedResume` / клиппинга по высоте листа.
4. Пересобрать: `npm run dist`.

## Содержимое этой папки

Копии эталонных файлов на момент снимка — см. подпапки `src/`, `electron/`, `styles/`.
