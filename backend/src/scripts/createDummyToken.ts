import "dotenv/config";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import db from "../config/database";

const USER_ID = 55;
const ORGANIZATION_ID = 69;
const TEMPLE_ID = 2;

const createDummyToken = async (): Promise<void> => {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured in .env");
        }

        console.log("Creating dummy token...");
        console.log("User ID:", USER_ID);
        console.log("Organization ID:", ORGANIZATION_ID);
        console.log("Temple ID:", TEMPLE_ID);

        /*
         * IMPORTANT:
         * Permission value 7 = FULL permission
         *
         * If your actual submodule code is different,
         * change the key accordingly.
         */
        const permissions: Record<string, number> = {
            temples: 7,
            temple: 7,
        };

        /*
         * Generate JWT
         */
        const accessToken = jwt.sign(
            {
                id: USER_ID,
                user_type: "Organization Admin",
                permissions,
            },
            JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        /*
         * Hash EXACTLY the same JWT
         * as authenticate middleware does.
         */
        const accessTokenHash = crypto
            .createHash("sha256")
            .update(accessToken)
            .digest("hex");

        /*
         * Generate refresh token
         */
        const refreshToken = crypto.randomBytes(64).toString("hex");

        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        /*
         * Get DB connection
         */
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            /*
             * Revoke old active sessions for user 2
             */
            await connection.execute(
                `
                UPDATE user_auth_sessions
                SET
                    revoked = 1,
                    revoked_at = NOW()
                WHERE user_id = ?
                  AND revoked = 0
                `,
                [USER_ID]
            );

            /*
             * Insert new session
             */
            await connection.execute(
                `
                INSERT INTO user_auth_sessions
                (
                    user_id,
                    organization_id,
                    temple_id,
                    provider,
                    provider_user_id,
                    access_token_hash,
                    refresh_token_hash,
                    token_expires_at,
                    refresh_expires_at,
                    ip_address,
                    user_agent,
                    revoked,
                    created_at,
                    last_used_at
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    'normal',
                    NULL,
                    ?,
                    ?,
                    DATE_ADD(NOW(), INTERVAL 7 DAY),
                    DATE_ADD(NOW(), INTERVAL 30 DAY),
                    '127.0.0.1',
                    'TMS-Dummy-Token',
                    0,
                    NOW(),
                    NOW()
                )
                `,
                [
                    USER_ID,
                    ORGANIZATION_ID,
                    TEMPLE_ID,
                    accessTokenHash,
                    refreshTokenHash,
                ]
            );

            await connection.commit();

            console.log("\n==========================================");
            console.log("       TMS DUMMY TOKEN CREATED");
            console.log("==========================================");

            console.log("\nUser ID:");
            console.log(USER_ID);

            console.log("\nOrganization ID:");
            console.log(ORGANIZATION_ID);

            console.log("\nTemple ID:");
            console.log(TEMPLE_ID);

            console.log("\nAccess Token:\n");
            console.log(accessToken);

            console.log("\n==========================================");
            console.log("COPY THE TOKEN ABOVE");
            console.log("==========================================\n");

            console.log("Authorization header:\n");
            console.log(`Bearer ${accessToken}`);

            console.log("\nToken expires in: 7 days\n");
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("\n❌ Failed to create dummy token:");

        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }

        process.exitCode = 1;
    }
};

void createDummyToken();