import mongoose from 'mongoose';

const JournalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  detectedEmotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'neutral', 'fear', 'surprise'],
    required: true
  },
  userEmotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'neutral', 'fear', 'surprise']
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const JournalEntry = mongoose.model('JournalEntry', JournalEntrySchema);

export default JournalEntry;