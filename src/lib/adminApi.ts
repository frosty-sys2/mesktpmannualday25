const ADMIN_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-operations`;

const getAdminPassword = () => {
  return sessionStorage.getItem('admin_password') || '';
};

export const setAdminPassword = (password: string) => {
  sessionStorage.setItem('admin_password', password);
};

export const clearAdminPassword = () => {
  sessionStorage.removeItem('admin_password');
};

async function adminRequest(body: any) {
  const response = await fetch(ADMIN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': getAdminPassword(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Schedule operations
export const scheduleApi = {
  list: () => adminRequest({ action: 'list', table: 'programme_schedule' }),
  insert: (data: any) => adminRequest({ action: 'insert', table: 'programme_schedule', data }),
  update: (id: string, data: any) => adminRequest({ action: 'update', table: 'programme_schedule', id, data }),
  upsert: (data: any[]) => adminRequest({ action: 'upsert', table: 'programme_schedule', data }),
  delete: (id: string) => adminRequest({ action: 'delete', table: 'programme_schedule', id }),
};

// Media operations
export const mediaApi = {
  list: () => adminRequest({ action: 'list', table: 'media_gallery' }),
  insert: (data: any) => adminRequest({ action: 'insert', table: 'media_gallery', data }),
  update: (id: string, data: any) => adminRequest({ action: 'update', table: 'media_gallery', id, data }),
  delete: (id: string) => adminRequest({ action: 'delete', table: 'media_gallery', id }),
  upload: async (file: File, path: string) => {
    const base64 = await fileToBase64(file);
    return adminRequest({
      action: 'upload',
      data: {
        bucket: 'media',
        path,
        fileBase64: base64,
        contentType: file.type,
      },
    });
  },
  deleteFile: (path: string) => adminRequest({
    action: 'deleteFile',
    data: { bucket: 'media', path },
  }),
};

// Links operations
export const linksApi = {
  list: () => adminRequest({ action: 'list', table: 'quick_links' }),
  insert: (data: any) => adminRequest({ action: 'insert', table: 'quick_links', data }),
  update: (id: string, data: any) => adminRequest({ action: 'update', table: 'quick_links', id, data }),
  delete: (id: string) => adminRequest({ action: 'delete', table: 'quick_links', id }),
};

// Community operations
export const communityApi = {
  list: () => adminRequest({ action: 'list', table: 'community_posts' }),
  update: (id: string, data: any) => adminRequest({ action: 'update', table: 'community_posts', id, data }),
  delete: (id: string) => adminRequest({ action: 'delete', table: 'community_posts', id }),
};

// Settings operations
export const settingsApi = {
  get: async (key: string) => {
    const result = await adminRequest({ action: 'getSetting', key });
    return result;
  },
  set: (key: string, value: any) => adminRequest({ action: 'setSetting', key, value }),
  delete: (key: string) => adminRequest({ action: 'deleteSetting', key }),
};

// Utility function
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}
