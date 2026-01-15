import { supabase } from '../config/supabase';

export interface StoredImageData {
  imageData: ImageData;
  imageSrc: string;
  timestamp: number;
}

export const storeImageData = async (id: string, imageData: ImageData, imageSrc: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('images')
      .insert({
        id,
        pixel_data: Array.from(imageData.data),
        width: imageData.width,
        height: imageData.height,
        original_url: imageSrc
      });

    if (error) {
      console.error('Supabase storage failed:', error);
      // Fallback to localStorage
      const fallbackData = {
        imageData: {
          width: imageData.width,
          height: imageData.height,
          data: Array.from(imageData.data)
        },
        imageSrc,
        timestamp: Date.now()
      };
      localStorage.setItem(`image-${id}`, JSON.stringify(fallbackData));
    }
  } catch (error) {
    console.error('Storage error:', error);
    // Fallback to localStorage
    const fallbackData = {
      imageData: {
        width: imageData.width,
        height: imageData.height,
        data: Array.from(imageData.data)
      },
      imageSrc,
      timestamp: Date.now()
    };
    localStorage.setItem(`image-${id}`, JSON.stringify(fallbackData));
  }
};

export const getImageData = async (id: string): Promise<StoredImageData | null> => {
  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      const imageData = new ImageData(
        new Uint8ClampedArray(data.pixel_data),
        data.width,
        data.height
      );

      return {
        imageData,
        imageSrc: data.original_url,
        timestamp: new Date(data.created_at).getTime()
      };
    } else {
      console.error('Supabase lookup failed for ID:', id, 'Error:', error);
    }

    // Fallback to localStorage
    const stored = localStorage.getItem(`image-${id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      const imageData = new ImageData(
        new Uint8ClampedArray(parsed.imageData.data),
        parsed.imageData.width,
        parsed.imageData.height
      );

      return {
        imageData,
        imageSrc: parsed.imageSrc,
        timestamp: parsed.timestamp
      };
    } else {
      console.error('No image found in localStorage for ID:', id);
    }

    console.error('No image found anywhere for ID:', id);
    return null;
  } catch (error) {
    console.error('Retrieval error:', error);
    return null;
  }
};

export const getAllStoredImages = async (): Promise<Array<{ id: string; imageSrc: string; timestamp: number }>> => {
  try {
    const { data, error } = await supabase
      .from('images')
      .select('id, original_url, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      return data.map(item => ({
        id: item.id,
        imageSrc: item.original_url,
        timestamp: new Date(item.created_at).getTime()
      }));
    }
  } catch (error) {
    console.error('Failed to fetch images:', error);
  }

  return [];
};