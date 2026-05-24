import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppNavigationProp, RootStackParamList } from '../navigation/types';
import type { RouteProp } from '@react-navigation/native';
// Mocking vision camera for compilation
// import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { theme } from '../constants/theme';
import { Button } from '../components/Button';
import { EyeSelector } from '../components/EyeSelector';
import { EyeSide } from '../models/types';
import { FileService } from '../services/FileService';
import { dbService } from '../database/SQLiteService';
import { useAppStore } from '../store/useAppStore';

const CameraScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Camera'>>();
  const { sessionId } = route.params;

  const session = useAppStore(state => state.currentSession);
  const addSessionCapture = useAppStore(state => state.addSessionCapture);

  const [hasPermission, setHasPermission] = useState(false);
  const [selectedEye, setSelectedEye] = useState<EyeSide>('left');
  const [isCapturing, setIsCapturing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');

  const toggleFlash = () => {
    setFlash(prev => prev === 'off' ? 'on' : prev === 'on' ? 'auto' : 'off');
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 5)); // max zoom 5x
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1)); // min zoom 1x
  
  // const devices = useCameraDevices();
  // const device = devices.back;
  // const camera = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      // const status = await Camera.requestCameraPermission();
      // setHasPermission(status === 'authorized');
      setHasPermission(true); // Mocking permission
    })();
  }, []);

  const handleCapture = async () => {
    if (!session) return;
    setIsCapturing(true);
    
    try {
      // const photo = await camera.current?.takePhoto({
      //   flash: flash,
      //   qualityPrioritization: 'quality',
      // });
      
      // Simulate photo capture delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const tempPath = `/mock/temp/photo_${Date.now()}.jpg`;

      const finalPath = FileService.generateRawFilePath(sessionId, selectedEye);
      await FileService.moveFileToPermanentStorage(tempPath, finalPath);

      const newCapture = {
        id: `img_${Date.now()}`,
        sessionId,
        patientId: session.patientId,
        eyeSide: selectedEye,
        rawImagePath: finalPath,
        captureTime: new Date().toISOString(),
        uploadStatus: 'pending' as const,
        enhancementStatus: 'not_started' as const,
      };

      await dbService.addCapturedImage(newCapture);
      addSessionCapture(newCapture);
      
      navigation.replace('ImageReview', { imageId: newCapture.id });
    } catch (error) {
      console.error('Failed to capture image', error);
      alert('Capture failed. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (!hasPermission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Camera permission denied.</Text>
        <Button title="Go Back" onPress={handleClose} />
      </View>
    );
  }

  // if (device == null) return <ActivityIndicator />

  return (
    <View style={styles.container}>
      {/* Mock Camera View */}
      <View style={styles.cameraPreview}>
        <Text style={styles.mockCameraText}>Live Camera Preview</Text>
        {/* <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
          zoom={zoom}
        /> */}
      </View>

      <View style={styles.overlayControls}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleClose}>
            <Text style={styles.iconText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleFlash}>
            <Text style={styles.iconText}>Flash: {flash}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.eyeSelectorWrapper}>
          <EyeSelector selectedEye={selectedEye} onSelectEye={setSelectedEye} />
        </View>
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleZoomOut}>
            <Text style={styles.iconText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.zoomText}>{zoom.toFixed(1)}x</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={handleZoomIn}>
            <Text style={styles.iconText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[styles.captureBtn, isCapturing && styles.captureBtnDisabled]} 
          onPress={handleCapture}
          disabled={isCapturing}
        >
          <View style={styles.captureBtnInner} />
        </TouchableOpacity>
        <View style={styles.bottomSpacer} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  errorText: { color: theme.colors.text, marginBottom: theme.spacing.lg },
  cameraPreview: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  mockCameraText: { color: '#666', fontSize: 18 },
  overlayControls: { position: 'absolute', top: 50, left: 0, right: 0, paddingHorizontal: theme.spacing.lg },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { paddingHorizontal: 15, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  iconText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  eyeSelectorWrapper: { marginTop: theme.spacing.lg, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: theme.radii.lg, padding: 4 },
  bottomBar: { height: 140, backgroundColor: '#000', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 20 },
  zoomControls: { flexDirection: 'row', alignItems: 'center', width: 100, justifyContent: 'space-between' },
  zoomText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bottomSpacer: { width: 100 },
  captureBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  captureBtnDisabled: { opacity: 0.5 },
  captureBtnInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },
});

export default CameraScreen;
