const express = require('express');
const router = express.Router();
const { executeQuery, saveQueryHistory, getQueryHistory, getAllQueries, clearQueryHistory, getTableNames, getTableInfo, dropTable } = require('../controllers/queryController');
const authMiddleware = require('../middlewares/authMiddleware');

// Example route to run SQL queries
router.post('/run-query', authMiddleware, executeQuery);
router.post('/save-query-history', authMiddleware, saveQueryHistory);
router.get('/query-history', authMiddleware, (req, res, next) => {
    console.log('Fetching query history for user:', req.user); // Debug log
    getQueryHistory(req, res, next);
});
router.get('/all-queries', authMiddleware, (req, res, next) => {
    console.log('Fetching all queries'); // Debug log
    getAllQueries(req, res, next);
});
router.delete('/query-history/clear', authMiddleware, clearQueryHistory);

// Add a new route to execute SQL
router.post('/execute-sql', authMiddleware, executeQuery);

// Add routes to fetch table names and table information
router.get('/tables', authMiddleware, getTableNames);
router.get('/table-info/:tableName', authMiddleware, getTableInfo);

// Add route to drop a table
router.delete('/table/:tableName', authMiddleware, dropTable);

module.exports = router;
