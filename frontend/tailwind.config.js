/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        noto: ['"Noto Sans Thai"', 'sans-serif'],
        inter: ['"Inter"', 'sans-serif'],
      },
      colors: {
        background:                 'hsl(var(--background))',
        foreground:                 'hsl(var(--foreground))',
        card:                       'hsl(var(--card))',
        'card-foreground':          'hsl(var(--card-foreground))',
        popover:                    'hsl(var(--popover))',
        'popover-foreground':       'hsl(var(--popover-foreground))',
        primary:                    'hsl(var(--primary))',
        'primary-foreground':       'hsl(var(--primary-foreground))',
        secondary:                  'hsl(var(--secondary))',
        'secondary-foreground':     'hsl(var(--secondary-foreground))',
        muted:                      'hsl(var(--muted))',
        'muted-foreground':         'hsl(var(--muted-foreground))',
        accent:                     'hsl(var(--accent))',
        'accent-foreground':        'hsl(var(--accent-foreground))',
        destructive:                'hsl(var(--destructive))',
        'destructive-foreground':   'hsl(var(--destructive-foreground))',
        border:                     'hsl(var(--border))',
        input:                      'hsl(var(--input))',
        ring:                       'hsl(var(--ring))',

        // Sidebar-specific tokens (ถ้าใช้ใน component)
        sidebar:                    'hsl(var(--sidebar))',
        'sidebar-foreground':       'hsl(var(--sidebar-foreground))',
        'sidebar-background':       'hsl(var(--sidebar-background))',
        'sidebar-accent':           'hsl(var(--sidebar-accent))',
        'sidebar-accent-foreground':'hsl(var(--sidebar-accent-foreground))',
        'sidebar-border':           'hsl(var(--sidebar-border))',
        'sidebar-ring':             'hsl(var(--sidebar-ring))',
      },
    },
  },
  plugins: [],
}
