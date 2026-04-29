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
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  } catch {
    return null;
  }
}

export interface DriveFile {
  id: string;
  name: string;
  createdTime: string;
}

export async function listBackupsFromDrive(accessToken: string): Promise<DriveFile[]> {
  const q = encodeURIComponent("name contains 'khata_backup_' and trashed=false");
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,createdTime)&orderBy=createdTime desc`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!response.ok) throw new Error('Failed to list backups from Google Drive.');
  const data = await response.json();
  return data.files || [];
}

export async function uploadBackupToDrive(
  accessToken: string,
  jsonContent: string
): Promise<void> {
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `khata_backup_${dateStr}.json`;

  const existingFiles = await listBackupsFromDrive(accessToken);
  for (const file of existingFiles) {
    if (file.name === fileName) {
      await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }
  }

  const metadata = { name: fileName, mimeType: 'application/json' };
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
    console.error('Upload Error:', err);
    throw new Error('Failed to upload backup to Google Drive.');
  }
}

export async function downloadBackupFromDrive(
  accessToken: string,
  fileId: string
): Promise<string> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!response.ok) throw new Error('Failed to download from Google Drive.');
  return await response.text();
}