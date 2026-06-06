"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decodeAudioData = decodeAudioData;
exports.decodePCMInBase64 = decodePCMInBase64;
var _reactNative = require("react-native");
var _specs = require("../specs");
var _errors = require("../errors");
var _paths = require("../utils/paths");
var _AudioBuffer = _interopRequireDefault(require("./AudioBuffer"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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
    if ((0, _paths.isRemoteSource)(stringSource)) {
      return this.decodeFromRemoteUrl(stringSource, rate, fetchOptions);
    }
    return this.decodeFromLocalFile(stringSource, rate);
  }
  async decodeFromArrayBuffer(arrayBuffer, sampleRate) {
    const buffer = await this.decoder.decodeWithMemoryBlock(
    // @ts-ignore internal function
    new Uint8Array(arrayBuffer), sampleRate);
    return new _AudioBuffer.default(buffer);
  }
  resolveStringSource(input) {
    return typeof input === 'number' ? _reactNative.Image.resolveAssetSource(input).uri : input;
  }
  assertSupportedStringSource(source) {
    if (typeof source !== 'string') {
      throw new TypeError('Input must be a module, uri or ArrayBuffer');
    }
    if ((0, _paths.isBase64Source)(source)) {
      throw new _errors.AudioApiError('Base64 source decoding is not currently supported, to decode raw PCM base64 strings use decodePCMInBase64 method.');
    }
    if ((0, _paths.isDataBlobString)(source)) {
      throw new _errors.AudioApiError('Data Blob string decoding is not currently supported.');
    }
  }
  async decodeFromRemoteUrl(url, sampleRate, fetchOptions) {
    const arrayBuffer = await fetch(url, fetchOptions).then(res => res.arrayBuffer());
    return this.decodeFromArrayBuffer(arrayBuffer, sampleRate);
  }
  resolveLocalFilePath(stringSource) {
    let filePath = stringSource.startsWith('file://') ? stringSource.replace('file://', '') : stringSource;
    if (_reactNative.Platform.OS === 'android' && !__DEV__ && !stringSource.startsWith('file://')) {
      filePath = _specs.NativeAudioAPIModule.resolveAndroidReleaseAsset(filePath);
      if (!filePath) {
        throw new _errors.AudioApiError('Failed to resolve asset for android release build.');
      }
    }
    return filePath;
  }
  async decodeFromLocalFile(stringSource, sampleRate) {
    const filePath = this.resolveLocalFilePath(stringSource);
    const buffer = await this.decoder.decodeWithFilePath(filePath, sampleRate);
    return new _AudioBuffer.default(buffer);
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
      throw new _errors.AudioApiError('Failed to decode audio data.');
    }
    return audioBuffer;
  }
  async decodePCMInBase64Instance(base64String, inputSampleRate, inputChannelCount, interleaved) {
    const buffer = await this.decoder.decodeWithPCMInBase64(base64String, inputSampleRate, inputChannelCount, interleaved);
    return new _AudioBuffer.default(buffer);
  }
}
async function decodeAudioData(input, sampleRate, fetchOptions) {
  return AudioDecoder.getInstance().decodeAudioDataInstance(input, sampleRate, fetchOptions);
}
async function decodePCMInBase64(base64String, inputSampleRate, inputChannelCount, isInterleaved = true) {
  return AudioDecoder.getInstance().decodePCMInBase64Instance(base64String, inputSampleRate, inputChannelCount, isInterleaved);
}
//# sourceMappingURL=AudioDecoder.js.map