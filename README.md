# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.15.3 create --template minimal --types ts --install npm .
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Database (SQLite + Drizzle)

Create an environment file using the example:

```sh
cp .env.example .env
```

Generate a migration from the schema and apply it:

```sh
npm run db:generate
npm run db:migrate
```

The database schema is defined in [src/lib/server/db/schema.ts](src/lib/server/db/schema.ts).
The Drizzle client is initialized in [src/lib/server/db/index.ts](src/lib/server/db/index.ts).

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
