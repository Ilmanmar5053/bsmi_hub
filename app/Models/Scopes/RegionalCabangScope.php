<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class RegionalCabangScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            // Only apply this scope if the user is an "anggota" and NOT an "admin"
            if ($user->hasRole('anggota') && !$user->hasRole('admin')) {
                $regionalCabang = null;
                
                // Fetch regional_cabang using DB facade to prevent infinite recursion
                // when querying the Member model which has this same scope applied.
                $memberData = \Illuminate\Support\Facades\DB::table('members')
                    ->where('user_id', $user->id)
                    ->first();
                
                if ($memberData) {
                    $regionalCabang = $memberData->regional_cabang;
                }
                
                if ($regionalCabang) {
                    $builder->where($model->getTable() . '.regional_cabang', $regionalCabang);
                } else {
                    // If they are an anggota but don't have a regional_cabang set, they see nothing
                    $builder->whereRaw('1 = 0');
                }
            }
        }
    }
}
