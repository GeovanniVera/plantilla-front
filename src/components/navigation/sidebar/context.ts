import { createContext, useContext } from 'react'

interface SidebarContextValue {
    expanded: boolean
    toggleExpanded: () => void
}

export const SidebarContext = createContext<SidebarContextValue>({
    expanded: false,
    toggleExpanded: () => {},
})

export function useSidebar() {
    return useContext(SidebarContext)
}
