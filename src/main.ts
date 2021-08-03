import fastify from "fastify";
import pointOfView from "point-of-view";
import fastifyStatic from "fastify-static";
import path from "path";
import { getServices } from "./services";
import { logger } from "./logger";

const server = fastify();

server.register(pointOfView, {
  engine: {
    twig: require('twig')
  }
});

server.register(fastifyStatic, {
  root: path.join(__dirname, "../public"),
});

server.get('/', async (request, reply) => {
  getServices().then((services) => {
    let groups = Array.from(services).reduce((groups, [key, value]) => (
      Object.assign(groups, { [key]: value }) // Be careful! Maps can have non-String keys; object literals can't.
    ), {});

    reply.view('/views/layout.html.twig', {groups});
  }).catch(logger.error);
});

server.listen(8080, function (err, address) {
  if (err) {
    logger.error(err);
    process.exit(1);
  }
  logger.info(`server listening on ${address}`);
});
