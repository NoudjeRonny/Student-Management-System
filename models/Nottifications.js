const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
});

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;
