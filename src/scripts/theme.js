// Theme initialization and management
export function initTheme() {
  const html = document.documentElement
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  // Determine initial theme
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
  
  // Set theme immediately to prevent flash
  html.setAttribute('data-theme', initialTheme)
  
  return initialTheme
}

export function toggleTheme() {
  const html = document.documentElement
  const currentTheme = html.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  
  html.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
  
  // Dispatch custom event for components to listen to
  window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: newTheme } }))
  
  return newTheme
}

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light'
}
