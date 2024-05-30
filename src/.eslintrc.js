module.exports = [
    {
        "env": {
            "browser": true,
            "es2021": true
        },
        "extends": [
            "eslint:recommended",
            "plugin:@typescript-eslint/recommended-type-checked"
        ],
        "overrides": [
            {
                "env": {
                    "node": true
                },
                "files": [
                    ".eslintrc.{js,cjs}"
                ],
                "parserOptions": {
                    "sourceType": "script"
                }
            }
        ],
        "parser": "@typescript-eslint/parser",
        "parserOptions": {
            "project": true,
            "ecmaVersion": "latest",
            "sourceType": "module",
            tsconfigRootDir: __dirname,
        },
        "plugins": [
            "@typescript-eslint"
        ],
        "rules": {
            "indent": [
                "error",
                4
            ],
            "linebreak-style": [
                "error",
                "unix"
            ],
            "quotes": [
                "error",
                "double"
            ],
            "semi": [
                "warn",
                "never"
            ]
        }
    }
];
