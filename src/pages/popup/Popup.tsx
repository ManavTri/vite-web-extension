import React from 'react';
import logo from '@assets/img/logo.svg';

export default function Popup() {
  return (
    <div className="bg-gray-800 p-4 text-gray-100">
      {/* Title */}
      <h1 className="text-center text-3xl font-semibold tracking-wide">Project Pal</h1>
      {/* List of project */}
      <div className="mt-4 flex flex-col gap-3">
        <button className="flex h-14 w-full items-center justify-center rounded-2xl border border-gray-700 bg-gray-100 text-base font-medium text-gray-900 transition hover:bg-gray-200 hover:shadow-sm cursor-pointer">
          Project 1
        </button>
        <button className="flex h-14 w-full items-center justify-center rounded-2xl border border-gray-700 bg-gray-100 text-base font-medium text-gray-900 transition hover:bg-gray-200 hover:shadow-sm cursor-pointer">
          Project 2
        </button>
        <button className="flex h-14 w-full items-center justify-center rounded-2xl border border-gray-700 bg-gray-100 text-base font-medium text-gray-900 transition hover:bg-gray-200 hover:shadow-sm cursor-pointer">
          Project 3
        </button>
        <button className="flex h-14 w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-500 text-base font-semibold text-gray-200 transition hover:border-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer">
          +
        </button>
      </div>
    </div>
  );
}
