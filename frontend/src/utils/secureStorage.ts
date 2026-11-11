import CryptoJS from "crypto-js";

const PUBLIC_KEY = String(import.meta.env.VITE_STORAGE_KEY);

export const secureStorage = {
    setItem: (key: string, value: unknown) => {
        const jsonValue = JSON.stringify(value);
        const encryptedValue = CryptoJS.AES.encrypt(jsonValue, PUBLIC_KEY).toString();
        sessionStorage.setItem(key, encryptedValue);

        if (key === "user" && import.meta.env.VITE_STORAGE_KEY) {
            sessionStorage.setItem("user_raw", jsonValue);
            sessionStorage.setItem("user_permissions", JSON.stringify((value as Record<string, unknown>).permissions));
        }
    },
    getItem: (key: string) => {
        const encryptedValue = sessionStorage.getItem(key);

        if (!encryptedValue) return null;

        try {
            const bytes = CryptoJS.AES.decrypt(encryptedValue, PUBLIC_KEY);
            const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedValue) return null;

            return JSON.parse(decryptedValue);
        } catch {
            sessionStorage.removeItem(key);
            return null;
        }
    },
    removeItem: (key: string) => sessionStorage.removeItem(key),
    clear: () => sessionStorage.clear()
};