export const WORKBENCH_SETTINGS = {
    complex_priority_map: {
        'low': 1,
        'medium': 2,
        'high': 3
    },
    grid_sizing: {
        xs: 12,
        sm: 12,
        md: 4,
        lg: 4,
        xl: 4
    },
    column_info: {
        proposals: [
            { id: 'expand', label: '', align: 'left' },
            { id: 'status', label: 'Status', align: 'center' },
            { id: 'creator', label: 'Creator', align: 'center' },
            { id: 'creator_status', label: 'Creator Status', align: 'center' },
            { id: 'is_private', label: 'Public', align: 'center' },
            { id: 'created', label: 'Created', align: 'right' },
        ],
        tasks: [
            { id: 'expand', label: '', align: 'left' },
            { id: 'state', label: 'Status', align: 'center' },
            { id: 'title', label: 'Title', align: 'center' },
            { id: 'is_private', label: 'Public', align: 'center' },
            { id: 'complexity', label: 'Complexity', align: 'center' },
            { id: 'priority', label: 'Priority', align: 'center' },
            { id: 'assigned_admins', label: 'Assigned Admins', align: 'center' },
            { id: 'created', label: 'Created', align: 'right' },
        ],
        tags: [
            { id: 'expand', label: '', align: 'left' },
            { id: 'name', label: 'Name', align: 'center' },
            { id: 'use_count', label: 'Use Count', align: 'center' },
            { id: 'created', label: 'Created', align: 'right' },
        ],
    }
};