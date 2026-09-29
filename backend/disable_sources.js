import fs from "fs";

const filePath =
"c:/Users/Mr Bob/Desktop/yuktiprep/backend/src/current-affairs/sources.js";

let code = fs.readFileSync(filePath, "utf8");

const keysToDisable = [
"finmin",
"imf",
"unep",
"iaea",
"fatf",
"yojana",
"kurukshetra",
"economist",
"down_to_earth",
"science_reporter",
"un_news",
"wef",
"sipri",
"sansad_tv",
];

for (const key of keysToDisable) {
const regex = new RegExp(
`\\s*new Source\\(\\{(?=[\\s\\S]*?key:\\s*['"]${key}['"])[\\s\\S]*?\\n\\s*\\}\\),`,
"g"
);

code = code.replace(regex, "");
}

fs.writeFileSync(filePath, code, "utf8");

console.log("Problematic sources removed successfully.");
