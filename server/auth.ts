import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { type User } from "@shared/schema";

export function setupAuth(app: Express) {
    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "r4nd0m_s3cr3t_k3y",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    };

    if (app.get("env") === "production") {
        app.set("trust proxy", 1);
        sessionSettings.cookie = {
            ...sessionSettings.cookie,
            secure: true
        };
    }

    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (clientID && clientSecret) {
        passport.use(new GoogleStrategy({
            clientID,
            clientSecret,
            callbackURL: "/api/auth/google/callback"
        }, async (_accessToken, _refreshToken, profile, done) => {
            try {
                const googleId = profile.id;
                let user = await storage.getUserByGoogleId(googleId);

                if (!user) {
                    // Create user
                    const username = profile.displayName || profile.emails?.[0].value || `user_${googleId}`;

                    // Simple username uniqueness check could be improved but sufficient for now
                    let finalUsername = username;
                    const existingUser = await storage.getUserByUsername(username);
                    if (existingUser) {
                        finalUsername = `${username}_${Math.floor(Math.random() * 1000)}`;
                    }

                    user = await storage.createUser({
                        username: finalUsername,
                        googleId: googleId,
                        password: null // No password for Google users
                    });
                }
                return done(null, user);
            } catch (err) {
                return done(err as Error);
            }
        }));
    } else {
        console.warn("Google Client ID or Secret missing. Google OAuth skipped.");
    }
}
