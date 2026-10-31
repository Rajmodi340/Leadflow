const express = require('express');
const router = express.Router();
const { getLeads, getLead, createLead, updateLead, deleteLead } = require('../controllers/leadController');
const { protect } = require('../middleware/auth');
const {
  createLeadValidator,
  updateLeadValidator,
  leadQueryValidator,
} = require('../validators/leadValidator');

router.use(protect);

router.get('/', leadQueryValidator, getLeads);
router.post('/', createLeadValidator, createLead);
router.get('/:id', getLead);
router.patch('/:id', updateLeadValidator, updateLead);
router.delete('/:id', deleteLead);

module.exports = router;
