export default function formatTimestamp(timestamp: string): string {
    // Create a new Date object from the timestamp
    const date = new Date(timestamp);

    // Format the date and time in a more human-readable format
    // Example: "December 15, 2023, 04:16:11"
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        // second: '2-digit',
        hour12: true
    });
};