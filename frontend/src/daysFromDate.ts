export default function getDaysFromDate(baseDate: Date, targetDate:Date = new Date()) {
	const diffInMs = targetDate - baseDate;
	return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}