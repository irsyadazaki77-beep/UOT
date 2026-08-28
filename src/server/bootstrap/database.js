/**
 * UNIVERSE OF TECH - DATABASE BOOTSTRAPPER
 * FASE 2 & 3: Deterministic Database & Repository Initialization
 */
const dbModule = require('../../../db');

function bootstrapDatabase() {
    // dbModule automatically initializes connection and runs Migrator
    return dbModule;
}

module.exports = {
    bootstrapDatabase
};
