export const themes = [
  { id: 'cultura-general-argentina', name: 'Cultura general argentina' },
  { id: 'cine-argentino', name: 'Cine argentino' },
  { id: 'cine-internacional', name: 'Cine internacional' },
  { id: 'futbol-argentino', name: 'Futbol argentino' },
  { id: 'historia-argentina', name: 'Historia argentina' },
  { id: 'musica-nacional', name: 'Musica nacional' },
  { id: 'personalizada', name: 'Personalizada' },
];

export const findThemeName = (themeId: string) =>
  themes.find((theme) => theme.id === themeId)?.name ?? themeId;
