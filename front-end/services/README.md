# AutoFacil API Services

This directory contains all API service modules for the AutoFacil application. The services are organized by domain and follow React/React Native best practices.

## 📁 Structure

```
services/
├── api-client.ts           # Core Axios instance with interceptors
├── auth.service.ts         # Authentication endpoints
├── student.service.ts      # Student-related endpoints
├── instructor.service.ts   # Instructor-related endpoints
├── scheduling.service.ts   # Booking/scheduling endpoints
├── payment.service.ts      # Payment and wallet endpoints
├── chat.service.ts         # Chat/messaging endpoints
├── tracking.service.ts     # GPS tracking endpoints
├── detran.service.ts       # Detran integration endpoints
├── lgpd.service.ts         # LGPD compliance endpoints
├── admin.service.ts        # Admin/moderation endpoints
├── hooks/
│   └── useApi.ts          # React hooks for API calls
└── index.ts               # Main exports
```

## 🚀 Features

- **Token Management**: Automatic JWT token handling with refresh logic
- **Request/Response Interceptors**: Auto-retry on 401 errors
- **TypeScript**: Full type safety with model interfaces
- **Error Handling**: Centralized error handling and user-friendly messages
- **File Uploads**: Support for multipart/form-data
- **React Hooks**: Custom hooks for loading/error states
- **Pagination Support**: Built-in pagination handling

## 📦 Installation

Make sure you have the required dependencies:

```bash
npm install axios @react-native-async-storage/async-storage
# or
yarn add axios @react-native-async-storage/async-storage
```

## 🔧 Configuration

Create a `.env` file in your project root:

```env
EXPO_PUBLIC_API_URL=https://api.autofacil.com/v1
```

## 📖 Usage Examples

### Basic Service Usage

```typescript
import { AuthService, StudentService, InstructorService } from '@/services';

// Login
const login = async (cpf: string, password: string) => {
  try {
    const response = await AuthService.login({ cpf, password });
    console.log('User logged in:', response.user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Get student profile
const getProfile = async () => {
  try {
    const profile = await StudentService.getProfile();
    console.log('Profile:', profile);
  } catch (error) {
    console.error('Failed to get profile:', error);
  }
};

// Search instructors
const searchInstructors = async () => {
  try {
    const results = await InstructorService.search({
      location: '-23.5505,-46.6333',
      radius: 10,
      category: ['B'],
      priceMax: 100,
      page: 1,
      limit: 10
    });
    console.log('Found instructors:', results.data);
  } catch (error) {
    console.error('Search failed:', error);
  }
};
```

### Using React Hooks

```typescript
import { useApi } from '@/services/hooks';
import { InstructorService } from '@/services';
import { useEffect } from 'react';

function InstructorSearchScreen() {
  const { data, loading, error, execute } = useApi(
    InstructorService.search
  );

  useEffect(() => {
    execute({
      location: '-23.5505,-46.6333',
      radius: 10,
      category: ['B'],
    });
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <FlatList
      data={data?.data}
      renderItem={({ item }) => <InstructorCard instructor={item} />}
    />
  );
}
```

### Pagination Example

```typescript
import { usePaginatedApi } from '@/services/hooks';
import { SchedulingService } from '@/services';

function BookingsScreen() {
  const { data, loading, hasMore, loadMore } = usePaginatedApi(
    (page) => SchedulingService.listBookings({ page, limit: 10 })
  );

  return (
    <FlatList
      data={data}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading ? <LoadingSpinner /> : null}
    />
  );
}
```

### File Upload Example

```typescript
import { AuthService } from '@/services';
import * as ImagePicker from 'expo-image-picker';

const registerStudent = async () => {
  // Pick images
  const rgResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });

  const proofResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });

  // Register with files
  const response = await AuthService.registerStudent({
    cpf: '12345678900',
    name: 'João Silva',
    birthDate: '2000-01-01',
    phone: '+5511987654321',
    email: 'joao@email.com',
    password: 'Password123',
    rg: {
      uri: rgResult.assets[0].uri,
      type: 'image/jpeg',
      name: 'rg.jpg',
    },
    proofOfAddress: {
      uri: proofResult.assets[0].uri,
      type: 'image/jpeg',
      name: 'proof.jpg',
    },
    acceptLGPD: true,
  });
};
```

### Booking Creation

```typescript
import { SchedulingService } from '@/services';

const createBooking = async (instructorId: string) => {
  try {
    const booking = await SchedulingService.createBooking({
      instrutorId: instructorId,
      dataHora: '2025-11-20T10:00:00Z',
      duracao: 2,
      localEncontro: {
        endereco: 'Rua das Flores, 123',
        coordenadas: {
          latitude: -23.5505,
          longitude: -46.6333,
        },
      },
      categoria: 'B',
      foco: ['manobras', 'estacionamento'],
    });
    
    console.log('Booking created:', booking);
  } catch (error) {
    console.error('Failed to create booking:', error);
  }
};
```

### Payment Flow

```typescript
import { PaymentService } from '@/services';

const processPayment = async (bookingId: string) => {
  try {
    // Create payment
    const payment = await PaymentService.createPayment({
      aulaId: bookingId,
      metodo: 'pix',
      valor: 150,
    });

    // If PIX, show QR code
    if (payment.qrCodePix) {
      showQRCode(payment.qrCodePix);
    }

    // Check payment status
    const paymentStatus = await PaymentService.getPayment(payment.pagamentoId);
    console.log('Payment status:', paymentStatus.status);
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

### GPS Tracking

```typescript
import { TrackingService } from '@/services';
import * as Location from 'expo-location';

const startLessonTracking = async (bookingId: string) => {
  // Start tracking
  const tracking = await TrackingService.startTracking(bookingId);
  
  // Update location periodically
  const locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000, // Every 5 seconds
      distanceInterval: 10, // Every 10 meters
    },
    async (location) => {
      await TrackingService.updateLocation(tracking.trackingId, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speed: location.coords.speed || 0,
        accuracy: location.coords.accuracy || 0,
      });
    }
  );

  // Later, stop tracking
  const result = await TrackingService.stopTracking(tracking.trackingId);
  console.log(`Lesson completed: ${result.distance}km in ${result.duration}s`);
  locationSubscription.remove();
};
```

### Emergency SOS

```typescript
import { TrackingService } from '@/services';
import * as Location from 'expo-location';

const sendEmergencySOS = async (bookingId: string) => {
  const location = await Location.getCurrentPositionAsync();
  
  const alert = await TrackingService.sendSOS(
    bookingId,
    location.coords.latitude,
    location.coords.longitude,
    'Preciso de ajuda urgente!'
  );
  
  console.log('SOS sent, notified:', alert.notifiedContacts);
};
```

### Chat Messaging

```typescript
import { ChatService } from '@/services';

const sendChatMessage = async (bookingId: string, message: string) => {
  try {
    const sentMessage = await ChatService.sendMessage(bookingId, {
      tipo: 'texto',
      conteudo: message,
    });
    
    console.log('Message sent:', sentMessage);
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};

// Load messages with pagination
const loadMessages = async (bookingId: string) => {
  const messages = await ChatService.getMessages(bookingId, {
    page: 1,
    limit: 50,
  });
  
  return messages.data;
};
```

### LGPD Compliance

```typescript
import { LGPDService } from '@/services';

// Request data export
const exportMyData = async () => {
  const exportRequest = await LGPDService.requestDataExport();
  
  // Check status later
  const exportData = await LGPDService.getDataExport(exportRequest.exportId);
  if (exportData.downloadUrl) {
    // Download the file
    console.log('Download from:', exportData.downloadUrl);
  }
};

// Delete account
const deleteMyAccount = async (password: string) => {
  const deletion = await LGPDService.requestAccountDeletion(
    password,
    'no_longer_needed',
    'Moving to another service'
  );
  
  console.log('Account will be deleted on:', deletion.scheduledDate);
};

// Update consent
const updateConsent = async () => {
  await LGPDService.updateConsentPreferences({
    marketing: false,
    analytics: true,
    locationTracking: true,
  });
};
```

## 🔐 Authentication Flow

The API client automatically handles authentication:

1. **Login**: Tokens are stored in AsyncStorage
2. **Requests**: Access token is automatically added to headers
3. **Token Refresh**: On 401 error, refresh token is used automatically
4. **Logout**: Tokens are cleared from storage

```typescript
import { AuthService, clearTokens } from '@/services';

// Login - tokens stored automatically
await AuthService.login({ cpf: '12345678900', password: 'pass' });

// All subsequent requests use the token automatically
await StudentService.getProfile(); // ✓ Authenticated

// Logout - tokens cleared
await AuthService.logout();
```

## 🛡️ Error Handling

All services use centralized error handling:

```typescript
import { handleApiError } from '@/services';

try {
  await SomeService.someMethod();
} catch (error) {
  const userMessage = handleApiError(error);
  Alert.alert('Erro', userMessage);
}
```

## 🧪 Testing

Example test with mock:

```typescript
import { AuthService } from '@/services';
jest.mock('@/services/api-client');

test('login should store tokens', async () => {
  const mockResponse = {
    accessToken: 'token123',
    refreshToken: 'refresh123',
    user: { id: '1', type: 'student' },
  };
  
  jest.spyOn(apiClient, 'post').mockResolvedValue({ data: mockResponse });
  
  const result = await AuthService.login({ cpf: '123', password: 'pass' });
  expect(result.accessToken).toBe('token123');
});
```

## 📝 Notes

- All services return typed data based on models in `lib/models/`
- Token refresh happens automatically on 401 errors
- File uploads use `multipart/form-data` encoding
- Environment variables should be prefixed with `EXPO_PUBLIC_` for Expo
- AsyncStorage is used for token persistence across app restarts

## 🔗 Related

- API Specification: `api.yaml`
- Data Models: `lib/models/`
- Cloud Functions: `cloud-functions/`

