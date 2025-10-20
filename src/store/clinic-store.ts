import { create } from "zustand"

interface Location {
  stateOrProvince: string
  cityOrDistrict: string
  street: string
  postalCode: string
  _id: string
}

interface Review {
  reviewNo: number
  rating: number
  comment: string
  patientName: string
}

interface Test {
  testNo: number
  testName: string
  price: number
  currencySymbol: string
  turnaroundTime: string
  preTestRequirements: string
  homeCollection: string
  insuranceCoverage: string
  description: string
  testImage: string
  clinicImage: string
  clinicName: string
}

interface DiscountCode {
  code: string
  discount: number
  validUntil: string
  description?: string
}

interface ClinicData {
  clinicId: number
  clinicName: string
  username: string
  bio: string
  avatar: string
  location: Location
  address?: string
  languages: string[]
  deliveryMethods: string[]
  onlineStatus: string
  country: string
  supportInsurance: number[]
  isVerified: boolean
  reviews: Review[]
  tests: Test[]
  discountCodes?: DiscountCode[]
}

interface ClinicStore {
  clinicData: ClinicData | null
  isLoading: boolean
  error: string | null
  availableSlots: string[]
  slotsLoading: boolean
  slotsError: string | null
  discountCodes: DiscountCode[]
  discountCodesLoading: boolean
  discountCodesError: string | null
  applyDiscountCode: (
    clinicId: number,
    code: string,
  ) => Promise<{ success: boolean; discount?: number; message?: string }>
  fetchClinicData: (username: string) => Promise<void>
  fetchAvailableSlots: (username: string, date: string) => Promise<void>
  fetchDiscountCodes: (clinicId: number) => Promise<void>
}

export const useClinicStore = create<ClinicStore>((set) => ({
  clinicData: null,
  isLoading: false,
  error: null,
  availableSlots: [],
  slotsLoading: false,
  slotsError: null,
  discountCodes: [],
  discountCodesLoading: false,
  discountCodesError: null,

  // ✅ Fetch clinic data by username
  fetchClinicData: async (username: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`https://clinic-backend.mylifeline.world/api/v1/clinic/public/${username}`)

      if (!response.ok) {
        throw new Error("Failed to fetch clinic data")
      }

      const result = await response.json()
      if (result.success) {
        const clinicData = result.data
        if (clinicData.location) {
          clinicData.address = `${clinicData.location.street}, ${clinicData.location.cityOrDistrict}, ${clinicData.location.stateOrProvince} ${clinicData.location.postalCode}`
        }
        set({ clinicData, isLoading: false })
      } else {
        throw new Error(result.message || "Failed to fetch clinic data")
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  // ✅ Fetch available slots for a given username and date
  fetchAvailableSlots: async (username: string, date: string) => {
    set({ slotsLoading: true, slotsError: null })
    try {
      const response = await fetch(
        `https://clinic-backend.mylifeline.world/api/v1/clinic/public/${username}/slots?date=${date}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch available slots")
      }

      const result = await response.json()
      if (result.success) {
        set({ availableSlots: result.data.slots, slotsLoading: false })
      } else {
        throw new Error(result.message || "Failed to fetch available slots")
      }
    } catch (error) {
      set({ slotsError: (error as Error).message, slotsLoading: false, availableSlots: [] })
    }
  },

  fetchDiscountCodes: async (clinicId: number) => {
    set({ discountCodesLoading: true, discountCodesError: null })
    try {
      const response = await fetch(`https://clinic-backend.mylifeline.world/api/v1/discount/clinic/${clinicId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch discount codes")
      }

      const result = await response.json()
      if (result.success && result.data) {
        set({ discountCodes: result.data, discountCodesLoading: false })
      } else {
        set({ discountCodes: [], discountCodesLoading: false })
      }
    } catch (error) {
      set({
        discountCodesError: (error as Error).message,
        discountCodesLoading: false,
        discountCodes: [],
      })
    }
  },

  applyDiscountCode: async (clinicId: number, code: string) => {
    try {
      const response = await fetch("https://clinic-backend.mylifeline.world/api/v1/discount/patient/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clinicId: clinicId.toString(),
          code: code.toUpperCase(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to apply discount code")
      }

      const result = await response.json()
      if (result.success) {
        return {
          success: true,
          discount: result.data?.discount || 0,
          message: result.message || "Discount applied successfully",
        }
      } else {
        return {
          success: false,
          message: result.message || "Invalid discount code",
        }
      }
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || "Failed to apply discount code",
      }
    }
  },
}))
