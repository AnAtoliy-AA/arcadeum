export const scrollbarStyles = `
  &::-webkit-scrollbar { width: 6px; height: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(236, 239, 238, 0.45); border-radius: 10px; transition: background 0.2s ease; }
  &::-webkit-scrollbar-thumb:hover { background: rgba(236, 239, 238, 0.7); }
  scrollbar-width: thin;
  scrollbar-color: rgba(236, 239, 238, 0.45) transparent;
`;
