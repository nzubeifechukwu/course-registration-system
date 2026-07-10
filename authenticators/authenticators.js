const prisma = require("../lib/prisma");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const localStrategy = new LocalStrategy(
  { usernameField: "email", passwordField: "password" },
  async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return done(null, false, {
          message: "Incorrect email and/or password.",
        });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, {
          message: "Incorrect email and/or password.",
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  },
);

function serializeSession(user, done) {
  done(null, user.id);
}

async function deserializeSession(id, done) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
}

module.exports = { localStrategy, serializeSession, deserializeSession };
