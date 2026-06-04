"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api, Organization, Space, ProjectList, Status, Tag, OrgMember } from "@/lib/api-client";
import { useSession } from "@/lib/auth";

export type ActiveView = "dashboard" | "board" | "list" | "calendar" | "members" | "settings";

interface AppContextType {
  orgs: Organization[];
  spaces: Space[];
  lists: ProjectList[];
  statuses: Status[];
  tags: Tag[];
  members: OrgMember[];
  
  activeOrgId: number | null;
  activeSpaceId: number | null;
  activeListId: number | null;
  activeView: ActiveView;
  
  setActiveOrgId: (id: number | null) => void;
  setActiveSpaceId: (id: number | null) => void;
  setActiveListId: (id: number | null) => void;
  setActiveView: (view: ActiveView) => void;

  isLoadingOrgs: boolean;
  isLoadingSpaces: boolean;
  isLoadingLists: boolean;
  
  refreshOrgs: () => Promise<void>;
  refreshSpaces: () => Promise<void>;
  refreshLists: () => Promise<void>;
  refreshStatuses: () => Promise<void>;
  refreshTags: () => Promise<void>;
  refreshMembers: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const { token } = useSession();
  
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [lists, setLists] = useState<ProjectList[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [members, setMembers] = useState<OrgMember[]>([]);
  
  const [activeOrgId, setActiveOrgId] = useState<number | null>(null);
  const [activeSpaceId, setActiveSpaceId] = useState<number | null>(null);
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [isLoadingLists, setIsLoadingLists] = useState(false);

  // 1. Fetch organizations on load
  const refreshOrgs = async () => {
    if (!token) return;
    setIsLoadingOrgs(true);
    try {
      const data = await api.orgs.list();
      setOrgs(data);
      if (data.length > 0 && !activeOrgId) {
        setActiveOrgId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load orgs", err);
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  // 2. Fetch spaces, tags, members when activeOrgId changes
  const refreshSpaces = async () => {
    if (!token || !activeOrgId) {
      setSpaces([]);
      return;
    }
    setIsLoadingSpaces(true);
    try {
      const data = await api.spaces.list(activeOrgId);
      setSpaces(data);
    } catch (err) {
      console.error("Failed to load spaces", err);
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  const refreshTags = async () => {
    if (!token || !activeOrgId) {
      setTags([]);
      return;
    }
    try {
      const data = await api.tags.list(activeOrgId);
      setTags(data);
    } catch (err) {
      console.error("Failed to load tags", err);
    }
  };

  const refreshMembers = async () => {
    if (!token || !activeOrgId) {
      setMembers([]);
      return;
    }
    try {
      const data = await api.orgs.listMembers(activeOrgId);
      setMembers(data);
    } catch (err) {
      console.error("Failed to load members", err);
    }
  };

  // 3. Fetch lists & statuses when activeSpaceId changes
  const refreshLists = async () => {
    if (!token || !activeSpaceId) {
      setLists([]);
      return;
    }
    setIsLoadingLists(true);
    try {
      const data = await api.lists.list(activeSpaceId);
      setLists(data);
    } catch (err) {
      console.error("Failed to load lists", err);
    } finally {
      setIsLoadingLists(false);
    }
  };

  const refreshStatuses = async () => {
    if (!token || !activeSpaceId) {
      setStatuses([]);
      return;
    }
    try {
      const data = await api.statuses.list(activeSpaceId);
      setStatuses(data);
    } catch (err) {
      console.error("Failed to load statuses", err);
    }
  };

  // Triggers
  useEffect(() => {
    if (token) {
      refreshOrgs();
    }
  }, [token]);

  useEffect(() => {
    if (activeOrgId) {
      refreshSpaces();
      refreshTags();
      refreshMembers();
      setActiveSpaceId(null);
      setActiveListId(null);
      setActiveView("dashboard");
    }
  }, [activeOrgId]);

  useEffect(() => {
    if (activeSpaceId) {
      refreshLists();
      refreshStatuses();
      setActiveListId(null);
      setActiveView("board"); // Default to Board view for space
    }
  }, [activeSpaceId]);

  return (
    <AppContext.Provider
      value={{
        orgs,
        spaces,
        lists,
        statuses,
        tags,
        members,
        
        activeOrgId,
        activeSpaceId,
        activeListId,
        activeView,
        
        setActiveOrgId,
        setActiveSpaceId,
        setActiveListId,
        setActiveView,

        isLoadingOrgs,
        isLoadingSpaces,
        isLoadingLists,
        
        refreshOrgs,
        refreshSpaces,
        refreshLists,
        refreshStatuses,
        refreshTags,
        refreshMembers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
