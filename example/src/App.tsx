import { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SaveFormat, useImageManipulator } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import {
  DataTypes,
  InterpolationFlags,
  type Mat,
  ObjectType,
  OpenCV,
  type Size,
} from 'react-native-fast-opencv';
import { Benchmark } from 'react-native-latency';

type PickedImage = {
  uri: string;
  name: string;
  width: number;
  height: number;
};

type OpenCVResizeContext = {
  source: Mat;
  destination: Mat;
  size: Size;
};

function getImageName(asset: ImagePicker.ImagePickerAsset) {
  if (asset.fileName) {
    return asset.fileName;
  }

  const uriParts = asset.uri.split('/');
  return uriParts[uriParts.length - 1] || 'Selected image';
}

export default function App() {
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [openCVResizeContext, setOpenCVResizeContext] =
    useState<OpenCVResizeContext | null>(null);
  const imageManipulator = useImageManipulator(
    pickedImage?.uri ?? './assets/favicon.png'
  );

  useEffect(() => {
    return () => {
      if (openCVResizeContext) {
        OpenCV.releaseBuffers([
          openCVResizeContext.source.id,
          openCVResizeContext.destination.id,
        ]);
      }
    };
  }, [openCVResizeContext]);

  const resizeSelectedImage = async () => {
    if (!pickedImage) {
      console.warn('No image selected');
      return;
    }

    imageManipulator.reset().resize({ width: 224, height: 224 });

    const image = await imageManipulator.renderAsync();
    await image.saveAsync({
      compress: 1,
      format: SaveFormat.PNG,
    });
  };

  const resizeSelectedImageWithFastOpenCV = () => {
    if (!openCVResizeContext) {
      console.warn('No image selected');
      return;
    }

    OpenCV.invoke(
      'resize',
      openCVResizeContext.source,
      openCVResizeContext.destination,
      openCVResizeContext.size,
      0,
      0,
      InterpolationFlags.INTER_CUBIC
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      mediaTypes: ['images'],
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    if (!asset.base64) {
      console.warn('Selected image did not include base64 data');
      return;
    }

    const source = OpenCV.base64ToMat(asset.base64);
    const destination = OpenCV.createObject(
      ObjectType.Mat,
      224,
      224,
      DataTypes.CV_8UC4
    );
    const size = OpenCV.createObject(ObjectType.Size, 224, 224);

    setOpenCVResizeContext({
      source,
      destination,
      size,
    });

    setPickedImage({
      uri: asset.uri,
      name: getImageName(asset),
      width: asset.width,
      height: asset.height,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.picker}>
        <Button title="Choose image" onPress={pickImage} />

        {pickedImage && (
          <View style={styles.imageInfo}>
            <Text style={styles.imageName}>Name: {pickedImage.name}</Text>
            <Text style={styles.imageDimensions}>
              Dimensions: {pickedImage.width} x {pickedImage.height}px
            </Text>
          </View>
        )}
      </View>

      {pickedImage && (
        <View style={styles.benchmarks}>
          <Benchmark callback={resizeSelectedImage} />
          <Benchmark callback={resizeSelectedImageWithFastOpenCV} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  picker: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  imageName: {
    fontSize: 16,
    fontWeight: '600',
  },
  imageDimensions: {
    color: 'dimgray',
    marginTop: 4,
  },
  benchmarks: {
    alignItems: 'center',
    gap: 32,
    width: '100%',
  },
});
