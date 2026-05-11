import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export const GOOGLE_WEB_CLIENT_ID = '599231181375-cnnhc737baviiciegelg9q34s58oe529.apps.googleusercontent.com';

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
    offlineAccess: true,
  });
}

export async function signInWithGoogle(): Promise<string> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  await GoogleSignin.signIn();
  const tokens = await GoogleSignin.getTokens();
  return tokens.accessToken;
}

export async function signOutGoogle(): Promise<void> {
  await GoogleSignin.signOut();
}

export async function getGoogleAccessToken(): Promise<string | null> {
  try {
    const isSignedIn = GoogleSignin.getCurrentUser() !== null;
    if (!isSignedIn) return null;
    
    // Aggressively refresh token to prevent 401 Unauthorized errors on background backups
    await GoogleSignin.signInSilently();
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  } catch (error) {
    console.warn('Failed to refresh Google access token:', error);
    return null;
  }
}

export interface DriveFile {
  id: string;
  name: string;
  createdTime: string;
}

const BACKUP_FOLDER_NAME = 'KhataBookBackups';

async function getOrCreateBackupFolder(accessToken: string): Promise<string> {
  // 1. Search for existing folder
  const q = encodeURIComponent(`name = '${BACKUP_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // 2. If not found, create it
  const metadata = {
    name: BACKUP_FOLDER_NAME,
    mimeType: 'application/vnd.google-apps.folder',
  };
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });
  if (!createRes.ok) {
    throw new Error('Could not create backup folder');
  }
  const createdData = await createRes.json();
  return createdData.id;
}

export async function listBackupsFromDrive(accessToken: string, identity: string): Promise<DriveFile[]> {
  try {
    const folderId = await getOrCreateBackupFolder(accessToken);
    const fileName = `khata_backup_${identity.replace(/[^a-zA-Z0-9@.-]/g, '_')}.json`;
    const q = encodeURIComponent(`name = '${fileName}' and '${folderId}' in parents and trashed=false`);
    
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,createdTime)&orderBy=createdTime desc`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) {
      const err = await response.text();
      console.error('List Backups API Error:', err);
      throw new Error(`Drive API Error: ${response.status}`);
    }
    const data = await response.json();
    return data.files || [];
  } catch (error: any) {
    console.error('Failed to list backups from Google Drive:', error);
    throw new Error('Failed to list backups from Google Drive.');
  }
}

export async function uploadBackupToDrive(
  accessToken: string,
  jsonContent: string,
  identity: string
): Promise<void> {
  const fileName = `khata_backup_${identity.replace(/[^a-zA-Z0-9@.-]/g, '_')}.json`;

  try {
    const folderId = await getOrCreateBackupFolder(accessToken);
    
    // Check if file exists inside this folder
    const existingFiles = await listBackupsFromDrive(accessToken, identity);
    for (const file of existingFiles) {
      if (file.name === fileName) {
        // Delete previous backup file to keep only one
        await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
    }

    const metadata = { 
      name: fileName, 
      mimeType: 'application/json',
      parents: [folderId] 
    };
    const boundary = 'foo_bar_baz';

    let body = '';
    body += `--${boundary}\r\n`;
    body += 'Content-Type: application/json; charset=UTF-8\r\n\r\n';
    body += JSON.stringify(metadata) + '\r\n';
    body += `--${boundary}\r\n`;
    body += 'Content-Type: application/json\r\n\r\n';
    body += jsonContent + '\r\n';
    body += `--${boundary}--`;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
          'Content-Length': body.length.toString(),
        },
        body,
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Upload Backup API Error:', err);
      throw new Error(`Drive Upload Error: ${response.status}`);
    }
  } catch (error: any) {
    console.error('Failed to upload backup to Google Drive:', error);
    throw new Error('Failed to upload backup to Google Drive.');
  }
}

export async function downloadBackupFromDrive(
  accessToken: string,
  fileId: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) {
      const err = await response.text();
      console.error('Download Backup API Error:', err);
      throw new Error(`Drive Download Error: ${response.status}`);
    }
    return await response.text();
  } catch (error: any) {
    console.error('Failed to download from Google Drive:', error);
    throw new Error('Failed to download from Google Drive.');
  }
}