module.exports = {
  // ... your existing config
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true, // Always try to resolve types even if the module isn't found
        project: "./tsconfig.json",
      },
    },
  },
};
