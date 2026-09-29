import argon2 from "argon2";

async function main() {
    const hash = await argon2.hash("Sumukh@129", {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
        hashLength: 32,
    });

    console.log(hash);
}

main();