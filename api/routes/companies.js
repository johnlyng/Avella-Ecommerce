const express = require('express');
const router = express.Router();
const companyService = require('../services/CompanyService').default;
const { verifyApiKey } = require('../middleware/auth');

// GET /api/companies - List companies
router.get('/', async (req, res, next) => {
    try {
        const { search, limit, offset } = req.query;
        const result = await companyService.getCompanies(
            search,
            limit ? parseInt(limit) : undefined,
            offset ? parseInt(offset) : undefined
        );
        res.json({ data: result });
    } catch (error) {
        next(error);
    }
});

// GET /api/companies/:id - Get company by ID
router.get('/:id', async (req, res, next) => {
    try {
        const company = await companyService.getCompanyById(parseInt(req.params.id));
        if (!company) {
            return res.status(404).json({ error: 'Not Found', message: 'Company not found' });
        }
        res.json({ data: company });
    } catch (error) {
        next(error);
    }
});

// POST /api/companies - Create company
router.post('/', async (req, res, next) => {
    try {
        const company = await companyService.createCompany(req.body);
        res.status(201).json({ data: company });
    } catch (error) {
        // Handle constraint violations if necessary later
        next(error);
    }
});

// PUT /api/companies/:id - Update company
router.put('/:id', verifyApiKey, async (req, res, next) => {
    try {
        const company = await companyService.updateCompany(parseInt(req.params.id), req.body);
        if (!company) {
            return res.status(404).json({ error: 'Not Found', message: 'Company not found' });
        }
        res.json({ data: company });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/companies/:id - Delete company
router.delete('/:id', verifyApiKey, async (req, res, next) => {
    try {
        const company = await companyService.deleteCompany(parseInt(req.params.id));
        if (!company) {
            return res.status(404).json({ error: 'Not Found', message: 'Company not found' });
        }
        res.json({ message: 'Company deleted successfully' });
    } catch (error) {
        if (error.code === '23503') { // Foreign key constraint violation
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Cannot delete company because it has associated users'
            });
        }
        next(error);
    }
});

module.exports = router;
