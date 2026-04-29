import * as React from 'react'

import { Button as ShadcnButton } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select } from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

function Button({ variant = 'default', className = '', size = 'lg', ...props }) {
  return (
    <ShadcnButton
      variant={variant}
      size={size}
      className={cn('w-full rounded-md shadow-sm', className)}
      {...props}
    />
  )
}

export {
  Button,
  Badge,
  Calendar,
  CalendarDayButton,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  Checkbox,
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  Textarea,
}
