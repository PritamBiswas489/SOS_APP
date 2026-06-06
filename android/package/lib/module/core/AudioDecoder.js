"use strict";

import { Image, Platform } from 'react-native';
import { NativeAudioAPIModule } from "../specs/index.js";
import { AudioApiError } from "../errors/index.js";
import { isBase64Source, isDataBlobString, isRemoteSource } from "../utils/paths.js";
import AudioBuffer from "./AudioBuffer.js";
class AudioDecoder {
  static instance = null;
  constructor() {
    this.decoder = global.createAudioDecoder();
  }
  async decodeAudioDataImplementation(input, sampleRate, fetchOptions) {
    const rate = sampleRate ?? 0;
    if (input instanceof ArrayBuffer) {
      return this.decodeFromArrayBuffer(input, rate);
    }
    const stringSource = this.resolveStringSource(input);
    this.assertSupportedStringSource(stringSource);
    if (isRemoteSource(stringSource)) {
      return this.decodeFromRemoteUrl(stringSource, rate, fetchOptions);
    }
    return this.decodeFromLocalFile(stringSource, rate);
  }
  async decodeFromArrayBuffer(arrayBuffer, sampleRate) {
    const buffer = await this.decoder.decodeWithMemoryBlock(
    // @ts-ignore internal function
    new Uint8Array(arrayBuffer), sampleRate);
    return new AudioBuffer(buffer);
  }
  resolveStringSource(input) {
    return typeof input === 'number' ? Image.resolveAssetSource(input).uri : input;
  }
  assertSupportedStringSource(source) {
    if (typeof source !== 'string') {
      throw new TypeError('Input must be a module, uri or ArrayBuffer');
    }
    if (isBase64Source(source)) {
      throw new AudioApiError('Base64 source decoding is not currently supported, to decode raw PCM base64 strings use decodePCMInBase64 method.');
    }
    if (isDataBlobString(source)) {
      throw new AudioApiError('Data Blob string decoding is not currently supported.');
    }
  }
  async decodeFromRemoteUrl(url, sampleRate, fetchOptions) {
    const arrayBuffer = await fetch(url, fetchOptions).then(res => res.arrayBuffer());
    return this.decodeFromArrayBuffer(arrayBuffer, sampleRate);
  }
  resolveLocalFilePath(stringSource) {
    let filePath = stringSource.startsWith('file://') ? stringSource.replace('file://', '') : stringSource;
    if (Platform.OS === 'android' && !__DEV__ && !stringSource.startsWith('file://')) {
      filePath = NativeAudioAPIModule.resolveAndroidReleaseAsset(filePath);
      if (!filePath) {
        throw new AudioApiError('Failed to resolve asset for android release build.');
      }
    }
    return filePath;
  }
  async decodeFromLocalFile(stringSource, sampleRate) {
    const filePath = this.resolveLocalFilePath(stringSource);
    const buffer = await this.decoder.decodeWithFilePath(filePath, sampleRate);
    return new AudioBuffer(buffer);
  }
  static getInstance() {
    if (!AudioDecoder.instance) {
      AudioDecoder.instance = new AudioDecoder();
    }
    return AudioDecoder.instance;
  }
  async decodeAudioDataInstance(input, sampleRate, fetchOptions) {
    const audioBuffer = await this.decodeAudioDataImplementation(input, sampleRate, fetchOptions);
    if (!audioBuffer) {
      throw new AudioApiError('Failed to decode audio data.');
    }
    return audioBuffer;
  }
  async decodePCMInBase64Instance(base64String, inputSampleRate, inputChannelCount, interleaved) {
    const buffer = await this.decoder.decodeWithPCMInBase64(base64String, inputSampleRate, inputChannelCount, interleaved);
    return new AudioBuffer(buffer);
  }
}
export async function decodeAudioData(input, sampleRate, fetchOptions) {
  return AudioDecoder.getInstance().decodeAudioDataInstance(input, sampleRate, fetchOptions);
}
export async function decodePCMInBase64(base64String, inputSampleRate, inputChannelCount, isInterleaved = true) {
  return AudioDecoder.getInstance().decodePCMInBase64Instance(base64String, inputSampleRate, inputChannelCount, isInterleaved);
}
//# sourceMappingURL=AudioDecoder.js.map