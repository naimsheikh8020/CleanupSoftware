export async function getAddressFromCoordinates(
  lat: number,
  lng: number,
): Promise<{ city: string; address: string } | string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    );
    const data = await response.json();

   //  console.log(data.address.city)

    if (data.display_name && data.address) {
      return {
         city: data.address.city || data.address.town || data.address.village || "",
        address: data.display_name,
      }
    }
    return "";
  } catch (error) {
    console.error("Error fetching address:", error);
    return "";
  }
}
