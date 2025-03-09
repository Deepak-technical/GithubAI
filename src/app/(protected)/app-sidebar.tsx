"use client"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { icons, LayoutDashboard, Bot, Presentation, CreditCard, Plus } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"
import useProject from "@/hooks/use-project"
import { UserButton, SignOutButton,SignedIn } from "@clerk/nextjs"

const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Q&A",
        url: "/qa",
        icon: Bot
    },
    {
        title: "Meetings",
        url: "/meetings",
        icon: Presentation
    },
    {
        title: "Billing",
        url: "/billing",
        icon: CreditCard

    },

]


const AppSidebar = () => {
    const pathname = usePathname();
    const { open } = useSidebar();
    const { projects, projectId, setProjectId } = useProject();

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    <Image src='/icons8-github-150.png' alt='logo' width={80} height={80} />
                    {open && <div className="text-xl font-bold text-primary/80">GitMind AI</div>}

                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map(item => {
                                return (<SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url} className={cn({ '!bg-primary !text-white': pathname === item.url }, 'list-none')}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>

                                </SidebarMenuItem>)
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Projects</SidebarGroupLabel>
                    <SidebarMenu>
                        {projects?.map(project => (
                            <SidebarMenuItem key={project.name}>
                                <SidebarMenuButton asChild>
                                    <div onClick={() => {
                                        setProjectId(project.id)
                                    }}>
                                        <div className={cn(
                                            'rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary',
                                            { 'bg-primary text-white': project.id === projectId } // Correct object syntax
                                        )}>
                                            {project.name[0]}
                                        </div>
                                        <span>{project.name}</span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                        <div className="h-2"></div>
                        <SidebarMenuItem>
                            <Link href="/create">

                                <Button variant={'outline'} className="w-fit" >
                                    <Plus />
                                    Create Project
                                </Button>
                            </Link>
                        </SidebarMenuItem>

                    </SidebarMenu>

                </SidebarGroup>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SignedIn>
                                <UserButton showName={true} />
                            </SignedIn>
                            {/* <UserButton showName={true} /> */}

                        </SidebarMenuItem>
                        <SidebarMenuItem className="mt-5">
                            <SignOutButton >
                                <Button variant='destructive' >LogOut</Button>
                            </SignOutButton></SidebarMenuItem>

                    </SidebarMenu>
                </SidebarGroup>


            </SidebarContent>

        </Sidebar>
    )
}

export default AppSidebar