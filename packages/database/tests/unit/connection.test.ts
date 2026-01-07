import mongoose from 'mongoose';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { connect, disconnect } from '../../src/connection.js';

describe('Connection', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Suppress console output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('connect', () => {
    test('should successfully connect to MongoDB', async () => {
      const mockConnect = vi.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

      await connect('mongodb://localhost:27017/test');

      expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost:27017/test');
      expect(console.log).toHaveBeenCalledWith('Connected to MongoDB');

      mockConnect.mockRestore();
    });

    test('should throw an error if connection fails', async () => {
      const errorMessage = 'Connection timeout';
      const mockConnect = vi.spyOn(mongoose, 'connect').mockRejectedValue(new Error(errorMessage));

      await expect(connect('mongodb://invalid:27017/test')).rejects.toThrow(
        `Failed to connect to MongoDB: ${errorMessage}`,
      );

      expect(mockConnect).toHaveBeenCalledWith('mongodb://invalid:27017/test');
      expect(console.error).toHaveBeenCalledWith(`Failed to connect to MongoDB: ${errorMessage}`);

      mockConnect.mockRestore();
    });

    test('should handle non-Error exceptions', async () => {
      const mockConnect = vi.spyOn(mongoose, 'connect').mockRejectedValue('String error');

      await expect(connect('mongodb://localhost:27017/test')).rejects.toThrow(
        'Failed to connect to MongoDB: Unknown error',
      );

      expect(console.error).toHaveBeenCalledWith('Failed to connect to MongoDB: Unknown error');

      mockConnect.mockRestore();
    });
  });

  describe('disconnect', () => {
    test('should successfully disconnect from MongoDB', async () => {
      const mockDisconnect = vi.spyOn(mongoose, 'disconnect').mockResolvedValue(undefined);

      await disconnect();

      expect(mockDisconnect).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Disconnected from MongoDB');

      mockDisconnect.mockRestore();
    });

    test('should throw an error if disconnection fails', async () => {
      const errorMessage = 'Disconnection error';
      const mockDisconnect = vi.spyOn(mongoose, 'disconnect').mockRejectedValue(new Error(errorMessage));

      await expect(disconnect()).rejects.toThrow(`Failed to disconnect from MongoDB: ${errorMessage}`);

      expect(mockDisconnect).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(`Failed to disconnect from MongoDB: ${errorMessage}`);

      mockDisconnect.mockRestore();
    });

    test('should handle non-Error exceptions during disconnect', async () => {
      const mockDisconnect = vi.spyOn(mongoose, 'disconnect').mockRejectedValue(null);

      await expect(disconnect()).rejects.toThrow('Failed to disconnect from MongoDB: Unknown error');

      expect(console.error).toHaveBeenCalledWith('Failed to disconnect from MongoDB: Unknown error');

      mockDisconnect.mockRestore();
    });
  });
});
