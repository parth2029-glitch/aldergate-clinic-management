package com.aldergate.clinic;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ClinicApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(entry -> {
            if (System.getProperty(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });

        requireMongoUri();
        requireJwtSecret();

        SpringApplication.run(ClinicApplication.class, args);
    }

    /**
     * Fails fast when MONGODB_URI is absent so the app can never silently fall back
     * to a local/Docker mongod. This project only connects to MongoDB Atlas; the
     * connection string lives in backend/.env (see backend/.env.example).
     */
    private static void requireMongoUri() {
        String uri = System.getProperty("MONGODB_URI");
        if (uri == null || uri.isBlank()) {
            uri = System.getenv("MONGODB_URI");
        }
        if (uri == null || uri.isBlank()) {
            throw new IllegalStateException("""
                    MONGODB_URI is not set. This project only connects to MongoDB Atlas.
                    Locally: create backend/.env containing:
                      MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/aldergate
                    (see backend/.env.example).
                    On Railway: add MONGODB_URI in the service Variables panel
                    (no .env file is deployed — Railway injects real env vars).
                    Startup aborted instead of falling back to localhost.""");
        }
    }

    /**
     * Fails fast when JWT_SECRET is absent or too short so the app can never
     * silently sign tokens with a key that lives in git history.
     */
    private static void requireJwtSecret() {
        String secret = System.getProperty("JWT_SECRET");
        if (secret == null || secret.isBlank()) {
            secret = System.getenv("JWT_SECRET");
        }
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("""
                    JWT_SECRET is not set. Tokens cannot be signed with a key from git.
                    Locally: create backend/.env containing:
                      JWT_SECRET=<at-least-32-characters-random-string>
                    (see backend/.env.example).
                    On Railway: add JWT_SECRET in the service Variables panel.
                    Startup aborted.""");
        }
        if (secret.getBytes(java.nio.charset.StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least 32 characters (256 bits) for HS256. Startup aborted.");
        }
    }
}
