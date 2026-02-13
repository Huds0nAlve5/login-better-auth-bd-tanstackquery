"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import logo from "@/public/logo.png";

export default function MenuBarPerson() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  async function onClick() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  }

  if (isPending) {
    return (
      <>
        <div className="flex justify-between bg-blue-700 items-center">
          <Skeleton className="h-[22px] w-[139px] rounded-full" />

          <div className="static right-0 text-center pr-5 py-1">
            <Skeleton className="h-[36px] w-[194px] rounded-2xl" />
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="flex justify-between bg-blue-700 items-center">
          <Image
            src={logo}
            alt="Grendene"
            width={120}
            height={40}
            priority
            className="pl-5"
          />

          <div className="static right-0 text-center pr-5 py-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="hover:cursor-pointer">
                <Button variant="outline">{data?.user.name}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="hover:cursor-pointer"
                    onClick={() => onClick()}
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </>
    );
  }
}
