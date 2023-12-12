window.addEventListener('DOMContentLoaded', event => {
    // Simple-DataTables
    // https://github.com/fiduswriter/Simple-DataTables/wiki

    const datatableScholar = document.getElementById('datatableScholars');
    if (datatableScholar) {
        new simpleDatatables.DataTable(datatableScholar);
    }
    const datatableOwner = document.getElementById('datatableOwners');
    if (datatableOwner) {
        new simpleDatatables.DataTable(datatableOwner);
    }
});
