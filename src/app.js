// Import the framework and instantiate it
import Fastify from 'fastify'
import routes from "./routes/routes.js";
import fastifyView from "@fastify/view";
import path from "node:path";
import ejs from "ejs";
import fastifyStatic from "@fastify/static";
import dbConnector from "./config/db.js";
import fastifyFormbody from "@fastify/formbody";
import logger from "./config/logger.js";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyCompress from "@fastify/compress";
import fastifyGracefulShutdown from "fastify-graceful-shutdown";

const __dirname = import.meta.dirname;

const fastify = new Fastify({
    loggerInstance: logger,
});

fastify.addHook("onRequest", async (request, reply) => {
    request.log.info(`Incoming request: ${request.method} ${request.url}`);
});

fastify.addHook("onResponse", async (request, reply) => {
    request.log.info(
        `Request completed: ${request.method} ${request.url} - Status ${reply.statusCode}`
    );
});

await fastify.register(fastifyCors);
await fastify.register(fastifyHelmet);
await fastify.register(fastifyCompress);
await fastify.register(fastifyGracefulShutdown);
fastify.register(fastifyFormbody)
fastify.register(dbConnector)

await fastify.register(fastifyView, {
    engine: {
        ejs,
    },
    root: path.join(__dirname, "views"),
    viewExt: "ejs",
    layout: "layout.ejs"
})

fastify.register(fastifyStatic, {
    root: path.join(__dirname, "public"),
    prefix: "/public/",
});

// Declare a route
await fastify.register(routes)

// Run the server!
try {
    await fastify.listen({ port: 3000 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}