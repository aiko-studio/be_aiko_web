import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { AIKO_JS_DIR } from "../config/constants.js";

export const handleAst = (req, res) => {
    const { code } = req.body;

    const targetInputFile = path.join(AIKO_JS_DIR, "src", "main.ak");
    
    try {
        // Tulis kode dari frontend langsung menimpa file tersebut
        fs.writeFileSync(targetInputFile, code);

        // Hitung path relatif dari file tersebut terhadap AIKO_JS_DIR (akan menghasilkan "src/main.ak")
        const relativePath = path.relative(AIKO_JS_DIR, targetInputFile);
        const testParserScript = path.resolve(AIKO_JS_DIR, "test/test_parser.js");

        // Jalankan parser dengan path relatif yang benar
        const child = spawn("node", [testParserScript, relativePath, "--json"], { cwd: AIKO_JS_DIR });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", d => stdout += d);
        child.stderr.on("data", d => stderr += d);
        
        child.on("close", (exitCode) => {
            if (exitCode !== 0) {
                return res.status(400).json({ error: stderr || "Parser failed" });
            }
            try {
                // Berikan output AST yang fresh ke frontend Svelte
                res.json({ ast: JSON.parse(stdout.trim()) });
            } catch (err) {
                console.error("Gagal parse AST. Output asli server:", stdout);
                res.status(500).json({ error: "Failed to parse AST output JSON" });
            }
        });
    } catch (err) {
        console.error("Gagal menulis file atau menjalankan pencarian AST:", err);
        res.status(500).json({ error: err.message });
    }
};