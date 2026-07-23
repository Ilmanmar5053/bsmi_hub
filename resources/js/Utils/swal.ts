import Swal, { SweetAlertOptions } from 'sweetalert2';

/**
 * Standard confirmation dialog
 * 
 * @param message The confirmation question text
 * @param options Custom SweetAlert options
 * @returns Promise<boolean> true if confirmed
 */
export const confirmAction = async (message: string, options: SweetAlertOptions = {}): Promise<boolean> => {
    // Detect if this is a dangerous action (like delete) based on keywords to change button color
    const lowerMsg = message.toLowerCase();
    const isDanger = lowerMsg.includes('hapus') || lowerMsg.includes('tolak') || lowerMsg.includes('delete');

    const defaultOptions: SweetAlertOptions = {
        title: 'Konfirmasi',
        text: message,
        icon: isDanger ? 'warning' : 'question',
        showCancelButton: true,
        confirmButtonColor: isDanger ? '#ef4444' : '#10b981', // red-500 or emerald-500
        cancelButtonColor: '#9ca3af', // gray-400
        confirmButtonText: isDanger ? 'Ya, Lanjutkan!' : 'Ya, Setuju!',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        customClass: {
            container: 'font-sans',
            popup: 'rounded-2xl shadow-xl border border-gray-100',
            confirmButton: 'rounded-lg font-medium px-5 py-2.5 ml-2',
            cancelButton: 'rounded-lg font-medium px-5 py-2.5',
            title: 'text-xl font-bold text-gray-800',
            htmlContainer: 'text-gray-600'
        }
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    // Merge customClasses correctly
    if (options.customClass) {
        finalOptions.customClass = { ...defaultOptions.customClass, ...(options.customClass as object) };
    }

    const result = await Swal.fire(finalOptions as any);
    return result.isConfirmed;
};

/**
 * Show a success notification
 */
export const showSuccess = (message: string, title: string = 'Berhasil!') => {
    Swal.fire({
        title,
        text: message,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: {
            container: 'font-sans mt-4 mr-4',
            popup: 'rounded-xl shadow-lg border border-gray-100',
            title: 'text-sm font-bold text-gray-800',
            htmlContainer: 'text-xs text-gray-600'
        }
    });
};

/**
 * Show an error notification
 */
export const showError = (message: string, title: string = 'Oops...') => {
    Swal.fire({
        title,
        text: message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Tutup',
        customClass: {
            container: 'font-sans',
            popup: 'rounded-2xl shadow-xl border border-gray-100',
            confirmButton: 'rounded-lg font-medium px-5 py-2.5',
        }
    });
};
