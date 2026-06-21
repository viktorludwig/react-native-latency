import { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SaveFormat, useImageManipulator } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { BenchMark } from 'react-native-latency';

type PickedImage = {
  uri: string;
  name: string;
  width: number;
  height: number;
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
  const imageManipulator = useImageManipulator(
    pickedImage?.uri ?? './assets/favicon.png'
  );

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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
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

      {pickedImage && <BenchMark callback={resizeSelectedImage} />}
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
});
