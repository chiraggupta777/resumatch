const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['match', 'score'], required: true },
  jobTitle: { type: String },
  matchScore: { type: Number },
  atsKeywordsFound: [String],
  atsKeywordsMissing: [String],
  strengths: [String],
  gaps: [String],
  suggestions: [String],
  overallScore: { type: Number },
  contentScore: { type: Number },
  impactScore: { type: Number },
  keywordScore: { type: Number },
  formatScore: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);
