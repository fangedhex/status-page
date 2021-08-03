import fastify from "fastify";
import pointOfView from "point-of-view";
import fastifyStatic from "fastify-static";
import path from "path";
import { getServices } from "./services";

// Require the framework and instantiate it
const server = fastify({
  //logger: true
})

server.register(pointOfView, {
  engine: {
    twig: require('twig')
  }
})

server.register(fastifyStatic, {
  root: path.join(__dirname, "../public"),
});

server.get('/', async (request, reply) => {
  const data = await getServices();

  let groups = Array.from(data).reduce((groups, [key, value]) => (
    Object.assign(groups, { [key]: value }) // Be careful! Maps can have non-String keys; object literals can't.
  ), {});

  reply.view('/views/layout.html.twig', {groups});
})

server.listen(8080, function (err, address) {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
  server.log.info(`server listening on ${address}`)
})
