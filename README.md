# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
# Algoshackproject

## Contact form

The contact page posts enquiries to `src/pages/api/contact.ts`, which forwards them to
the configured webhook. For local development, copy `.env.example` to `.env` and set
`CONTACT_WEBHOOK_URL`. In production, provide the variables through the server's
environment. The site key and secret are optional and must both be configured to enable
reCAPTCHA.

## Deploy to Vercel

The site uses Astro's Vercel adapter so page routes and the contact API are deployed as
Vercel serverless functions. In the Vercel project, use the repository root as the
project root and `npm run build` as the build command. Set `CONTACT_WEBHOOK_URL` in the
project's environment variables for each deployment environment that should accept
contact enquiries. Vercel's Astro integration handles the output directory and route
configuration.

Deploy the latest commit to make route changes live. The production site should expose
`/`, `/about`, `/contact`, and `/help`.
