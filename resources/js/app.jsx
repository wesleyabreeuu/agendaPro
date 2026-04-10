import './bootstrap'
import '../css/app.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { ThemeProvider } from './contexts/ThemeContext'

createInertiaApp({
  resolve: async (name) => {
    const pages = import.meta.glob('./pages/**/*.jsx')
    const page = await pages[`./pages/${name}.jsx`]()
    return page
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <ThemeProvider>
        <App {...props} />
      </ThemeProvider>,
    )
  },
  progress: {
    color: '#18181b',
  },
})
