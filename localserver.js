require("dotenv/config");
const fastify = require("fastify")({ logger: true, https: true });
const mongoose = require("mongoose");

fastify.register(require("fastify-tls-keygen"), {
  // Optional (default: ./key.pem)
  // key: '/path/to/save/private/key.pem',
  // Optional (default: ./cert.pem)
  // cert: '/path/to/save/public/certificate.pem'
  key: "./key.pem",
  cert: "./cert.pem",
});

fastify.register(require("fastify-cors"), {
  origin: "*",
});

fastify.register(require("fastify-jwt"), {
  secret: process.env.JWTKEY,
});

fastify.register(require("./middleware/auth.middleware"));
fastify.register(require("./routes/user.auth.route"));
fastify.register(require("./routes/index"));

try {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Connected Successfully."));
} catch (err) {
  console.log(err);
}

(async () => {
  try {
    await fastify.listen(9090, "0.0.0.0");
    // fastify.log.info(`API is listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
